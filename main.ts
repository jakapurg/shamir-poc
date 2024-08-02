import {combine, split} from 'shamir-secret-sharing';
import {randomBytes, } from 'crypto';
const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

const generatePrivateKey = () =>
{
  const privateKey = randomBytes(32);
  const key = privateKey.toString('hex');
  console.log("Generated private key: ", key);
  return key;
} 




async function shamirPoC() {

    // Generate private key that will be split

    const secret = generatePrivateKey();


    let shares = await split(textEncoder.encode(secret), 3,2);
   
    shares.map((share,i) => {
        console.log(`Shard ${i+1}: ${textDecoder.decode(share)}`);
    })

    // Shard 1 is sent to the device
    // localStorage.setItem('s1',shares[0])

    // Shard 2 is sent to the server, encrypted by KSM keys
    const s2 = shares[1];
    // Fetch KSM key
    // const ksmKey = await fetchKsmKey();
    // const encryptedS2 = await encrypt(s2, ksmKey);
    // send to our BE

    // Shar 3 is sent to the user (encrypted by something user defined - oauth key or something user specific)
    const s3 = shares[2];
    // const userKey = await fetchUserKey();
    // const encryptedS3 = await encrypt(s3, userKey);

    return shares;


   
    console.log("RECOVERED")
    console.log("From 1 and 2")
    const recovered = await combine(shares.slice(0, 2));
    console.log(textDecoder.decode(recovered));

    console.log("From 2 and 3")
    const recovered2 = await combine(shares.slice(1, 3));
    console.log(textDecoder.decode(recovered2));

    console.log("From 1 and 3")
    const recovered3 = await combine([shares[0], shares[2]]);
    console.log(textDecoder.decode(recovered3));



}

async function run() {
  const shares = await shamirPoC();

  // When user logs in on known device:
  console.log("Recovery when user logs in on known device");
  const s1 = shares[0];
  const s2 = shares[1];
  // Decrypt s2
  // const ksmKey = await fetchKsmKey();
  // const decryptedS2 = await decrypt(s2, ksmKey);
  // Combine s1 and s2
  const recovered = await combine([s1, s2]);
  console.log("Recovered secret: ", textDecoder.decode(recovered));



  console.log("Recovery when user logs in on unknown device");
  const s3 = shares[2];
  // Decrypt s3
  // const userKey = await fetchUserKey();
  // const decryptedS3 = await decrypt(s3, userKey);
  // Combine s1 and s3
  const recovered2 = await combine([s1, s3]);
  console.log("Recovered secret: ", textDecoder.decode(recovered2));


}

run()
  .then(() => {
    console.log('done');
    process.exit(0);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
