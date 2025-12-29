import { ethers } from "ethers";
import abi from "./presaleAbi.json";

const PRESALE_ADDRESS = "0x03cBDFDC60e4453972C7821ac50CCBAb8a0336D7";
const USDT_ADDRESS = "0x55d398326f99059ff775485246999027b3197955";

let provider;
let signer;
let presale;
let usdt;

async function init() {
  if (!window.ethereum) return alert("Install Metamask");

  provider = new ethers.BrowserProvider(window.ethereum);
  signer = await provider.getSigner();

  presale = new ethers.Contract(PRESALE_ADDRESS, abi, provider);
  usdt = new ethers.Contract(
    USDT_ADDRESS,
    [
      "function approve(address,uint256) external returns(bool)"
    ],
    signer
  );

  await loadData();
}

async function loadData() {
  const price = await presale.pricePerTokenUSDT();
  document.getElementById("price").innerText =
    "Price: $" + ethers.formatUnits(price, 18);

  const sold = await presale.tokensSold();
  const cap = await presale.saleCap();

  document.getElementById("sold").innerText =
    ethers.formatUnits(sold, 18) + " / " + ethers.formatUnits(cap, 18);

  const percent = Number(sold) * 100 / Number(cap);
  document.getElementById("bar").style.width = percent + "%";
}

window.buyBNB = async () => {
  const amount = document.getElementById("amount").value;
  const value = await presale.getTokenPriceNative() * BigInt(amount);

  const tx = await presale
    .connect(signer)
    .buyTokens(amount, false, { value });

  await tx.wait();
  loadData();
};

window.buyUSDT = async () => {
  const amount = document.getElementById("amount").value;
  const price = await presale.pricePerTokenUSDT();
  const cost = price * BigInt(amount);

  await usdt.approve(PRESALE_ADDRESS, cost);

  const tx = await presale
    .connect(signer)
    .buyTokens(amount, true);

  await tx.wait();
  loadData();
};

init();
