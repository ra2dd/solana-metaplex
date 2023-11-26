import { initializeKeypair } from "./initializeKeypair"
import { Connection, clusterApiUrl, Keypair } from "@solana/web3.js"
import {
  Metaplex,
  keypairIdentity,
  bundlrStorage,
} from "@metaplex-foundation/js"
import {
  uploadMetadata,
  createNft,
  updateNftUri,
  createCollectionNft,
  CollectionNftData
} from "./metaplexHelper"

// example data for a new NFT
const nftData = {
  name: "Name",
  symbol: "SYMBOL",
  description: "Description",
  sellerFeeBasisPoints: 0,
  imageFile: "solana.png",
}

// example data for updating an existing NFT
const updateNftData = {
  name: "Update",
  symbol: "UPDATE",
  description: "Update Description",
  sellerFeeBasisPoints: 100,
  imageFile: "success.png",
}

function getCollectionNftData(user: Keypair): CollectionNftData {
  return {
    name: "TestCollectionNFT",
    symbol: "TEST",
    description: "Test Description Collection",
    sellerFeeBasisPoints: 100,
    imageFile: "success.png",
    isCollection: true,
    collectionAuthority: user,
  }
}

async function main() {
  // create a new connection to the cluster's API
  const connection = new Connection(clusterApiUrl("devnet"))

  // initialize a keypair for the user
  const user = await initializeKeypair(connection)

  console.log("PublicKey:", user.publicKey.toBase58())

  // metaplex set up
  const metaplex = Metaplex.make(connection)
    .use(keypairIdentity(user))
    .use(
      bundlrStorage({
        address: "https://devnet.bundlr.network",
        providerUrl: "https://api.devnet.solana.com",
        timeout: 60000,
      }),
    );

  // upload NFT collection data and get uri for the metadata
  const collectionNftData = getCollectionNftData(user)
  const collectionUri = await uploadMetadata(metaplex, collectionNftData)

  // create NFT collection using the helper function and uri with metadata
  const collectionNft = await createCollectionNft(
    metaplex,
    collectionUri,
    collectionNftData,
  )


  // upload NFT data and get the uri for the metadata
  const uri = await uploadMetadata(metaplex, nftData)

  // create NFT using the helper function and uri with metadata
  const nft = await createNft(
    metaplex, 
    uri, 
    nftData, 
    collectionNft.mint.address
  )
  
  
  // upload updated NFT data and get new uri for the metadata
  const updatedUri = await uploadMetadata(metaplex, updateNftData)

  // update the NFT using the helper function and the new URI from the metadata
  await updateNftUri(metaplex, updatedUri, nft.address)
}

main()
  .then(() => {
    console.log("Finished successfully")
    process.exit(0)
  })
  .catch((error) => {
    console.log(error)
    process.exit(1)
  })
