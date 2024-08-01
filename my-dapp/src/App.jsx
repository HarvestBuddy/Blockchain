import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import './App.css';
import { abi } from './assets/Json/LandMarketplace.json'; 

const contractABI = abi;
const contractAddress = '0x038a490A9A3846E484E0a6CCb94093Be4Caa7A86';

function App() {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [account, setAccount] = useState('');
  const [landDetails, setLandDetails] = useState('');
  const [landPrice, setLandPrice] = useState('');
  const [landId, setLandId] = useState('');
  const [lands, setLands] = useState([]);

  useEffect(() => {
    const initializeEthers = async () => {
      if (window.ethereum) {
        try {
          const web3Provider = new ethers.providers.Web3Provider(window.ethereum);
          setProvider(web3Provider);

          await window.ethereum.request({ method: 'eth_requestAccounts' });
          const signer = web3Provider.getSigner();
          setSigner(signer);
          const address = await signer.getAddress();
          setAccount(address);
        } catch (err) {
          console.error('User denied account access', err);
        }
      } else {
        console.error('MetaMask not detected');
      }
    };

    initializeEthers();
  }, []);

  useEffect(() => {
    if (provider) {
      loadLands();
      window.ethereum.on('accountsChanged', async (accounts) => {
        if (accounts.length > 0) {
          const web3Provider = new ethers.providers.Web3Provider(window.ethereum);
          setProvider(web3Provider);
          const signer = web3Provider.getSigner();
          setSigner(signer);
          const address = await signer.getAddress();
          setAccount(address);
        } else {
          setAccount('');
          setSigner(null);
        }
      });
    }
  }, [provider]);

  const registerLand = async () => {
    if (!signer) return;

    const contract = new ethers.Contract(contractAddress, contractABI, signer);
    try {
      const tx = await contract.registerLand(landDetails);
      await tx.wait();
      console.log('Land registered:', tx);
    } catch (err) {
      console.error('Error registering land:', err);
    }
  };

  const listLandForSale = async () => {
    if (!signer) return;

    const contract = new ethers.Contract(contractAddress, contractABI, signer);
    try {
      const tx = await contract.sell(parseInt(landId), ethers.utils.parseEther(landPrice));
      await tx.wait();
      console.log('Land listed for sale:', tx);
    } catch (err) {
      console.error('Error listing land for sale:', err);
    }
  };

  const buyLand = async (id, price) => {
    if (!signer) return;

    const contract = new ethers.Contract(contractAddress, contractABI, signer);
    try {
      const tx = await contract.buy(id, { value: price });
      await tx.wait();
      console.log('Land purchased:', tx);
    } catch (err) {
      console.error('Error buying land:', err);
    }
  };

  const fetchLandDetails = async (id) => {
    if (!provider) return null;

    const contract = new ethers.Contract(contractAddress, contractABI, provider);
    try {
      const data = await contract.getLandData(id);
      return {
        owner: data[0],
        details: data[1],
        price: data[2],
        forSale: data[3],
      };
    } catch (err) {
      console.error('Error fetching land details:', err);
      return null;
    }
  };

  const loadLands = async () => {
    let loadedLands = [];
    for (let i = 0; i < 10; i++) {
      const land = await fetchLandDetails(i);
      if (land) {
        loadedLands.push({
          id: i,
          owner: land.owner || 'Unknown',
          details: land.details || 'No details',
          price: land.price || ethers.constants.Zero,
          forSale: land.forSale || false,
        });
      }
    }
    setLands(loadedLands);
  };

  return (
    <div className="App">
      <h1>Land Marketplace DApp</h1>
      <p>Connected Account: {account || 'Not connected'}</p>

      <div>
        <h2>Register New Land</h2>
        <input
          type="text"
          placeholder="Land Details"
          value={landDetails}
          onChange={(e) => setLandDetails(e.target.value)}
        />
        <button onClick={registerLand}>Register Land</button>
      </div>

      <div>
        <h2>List Land for Sale</h2>
        <input
          type="number"
          placeholder="Land ID"
          value={landId}
          onChange={(e) => setLandId(e.target.value)}
        />
        <input
          type="text"
          placeholder="Price (in ETH)"
          value={landPrice}
          onChange={(e) => setLandPrice(e.target.value)}
        />
        <button onClick={listLandForSale}>List Land</button>
      </div>

      <div>
        <h2>Available Lands</h2>
        <ul>
          {lands.map((land, index) => (
            <li key={index}>
              ID: {land.id}, Owner: {land.owner}, Details: {land.details}, Price: {ethers.utils.formatEther(land.price || '0')} ETH, For Sale: {land.forSale.toString()}
              {land.forSale && <button onClick={() => buyLand(land.id, land.price)}>Buy</button>}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default App;
