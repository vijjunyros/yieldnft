import { useState } from "react";
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { parseEther, formatEther } from "viem";
const ADDR = import.meta.env.VITE_CONTRACT_ADDRESS as `0x${string}`;
const ACCENT = "#ec4899";
const ABI = [
  { name:"mint", type:"function", stateMutability:"payable", inputs:[{name:"uri",type:"string"}], outputs:[{type:"uint256"}] },
  { name:"getOwned", type:"function", stateMutability:"view", inputs:[{name:"user",type:"address"}], outputs:[{type:"uint256[]"}] },
  { name:"getToken", type:"function", stateMutability:"view", inputs:[{name:"id",type:"uint256"}], outputs:[{type:"address"},{type:"string"},{type:"uint256"}] },
  { name:"totalSupply", type:"function", stateMutability:"view", inputs:[], outputs:[{type:"uint256"}] },
  { name:"mintPrice", type:"function", stateMutability:"view", inputs:[], outputs:[{type:"uint256"}] },
  { name:"withdraw", type:"function", stateMutability:"nonpayable", inputs:[], outputs:[] },
] as const;
const s: Record<string, React.CSSProperties> = {
  page:{minHeight:"100vh",background:"#080b14",color:"#e2e8f0",fontFamily:"Inter,sans-serif",padding:"24px"},
  header:{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:32},
  title:{fontSize:24,fontWeight:700,color:ACCENT},
  tabs:{display:"flex",gap:8,marginBottom:24},
  tab:(a:boolean)=>({padding:"8px 20px",borderRadius:8,border:"none",cursor:"pointer",background:a?ACCENT:"#1e2533",color:a?"#000":"#94a3b8",fontWeight:600}),
  card:{background:"#111827",borderRadius:12,padding:20,marginBottom:16,border:"1px solid #1e2533"},
  label:{display:"block",fontSize:13,color:"#94a3b8",marginBottom:6},
  input:{width:"100%",background:"#1e2533",border:"1px solid #374151",borderRadius:8,padding:"10px 14px",color:"#e2e8f0",fontSize:14,boxSizing:"border-box" as const,marginBottom:14},
  btn:{background:ACCENT,color:"#000",border:"none",borderRadius:8,padding:"10px 20px",fontWeight:700,cursor:"pointer",fontSize:14},
};
function TokenCard({id}:{id:bigint}){
  const {data}=useReadContract({address:ADDR,abi:ABI,functionName:"getToken",args:[id]});
  if(!data)return null;
  const [owner,uri]=data as [string,string,bigint];
  return(<div style={s.card}><div style={{fontWeight:700,marginBottom:4}}>🖼️ Token #{id.toString()}</div><div style={{fontSize:12,color:"#64748b",marginBottom:4}}>Owner: {owner.slice(0,16)}...</div><div style={{fontSize:13,color:ACCENT,wordBreak:"break-all"}}>{uri||"(no uri)"}</div></div>);
}
export default function App(){
  const {isConnected,address}=useAccount();
  const [tab,setTab]=useState<"gallery"|"mine"|"mint">("gallery");
  const [uri,setUri]=useState("");
  const {data:total}=useReadContract({address:ADDR,abi:ABI,functionName:"totalSupply"});
  const {data:price}=useReadContract({address:ADDR,abi:ABI,functionName:"mintPrice"});
  const {data:owned}=useReadContract({address:ADDR,abi:ABI,functionName:"getOwned",args:[address??("0x0" as `0x${string}`)]});
  const {writeContract,data:hash,isPending}=useWriteContract();
  const {isLoading}=useWaitForTransactionReceipt({hash});
  const allIds=total?Array.from({length:Number(total)},(_,i)=>BigInt(i)):[];
  return(<div style={s.page}>
    <div style={s.header}><div><div style={s.title}>🖼️ YieldNFT</div><div style={{fontSize:13,color:"#64748b"}}>On-chain NFT minting • {total?.toString()??0} minted</div></div><ConnectButton/></div>
    {!isConnected?<div style={{textAlign:"center",padding:60,color:"#64748b"}}>Connect wallet to mint or view NFTs</div>:(
    <><div style={s.tabs}>
      <button style={s.tab(tab==="gallery")} onClick={()=>setTab("gallery")}>Gallery</button>
      <button style={s.tab(tab==="mine")} onClick={()=>setTab("mine")}>My NFTs</button>
      <button style={s.tab(tab==="mint")} onClick={()=>setTab("mint")}>Mint</button>
    </div>
    {tab==="gallery"&&<div>{allIds.length?[...allIds].reverse().map(id=><TokenCard key={id.toString()} id={id}/>):<div style={{color:"#64748b",padding:20}}>No NFTs minted yet</div>}</div>}
    {tab==="mine"&&<div>{(owned as bigint[])?.length?(owned as bigint[]).map(id=><TokenCard key={id.toString()} id={id}/>):<div style={{color:"#64748b",padding:20}}>No NFTs yet — mint one!</div>}</div>}
    {tab==="mint"&&<div style={s.card}>
      <div style={{fontWeight:700,marginBottom:16}}>Mint NFT {price?<span style={{color:ACCENT,fontSize:14}}>({formatEther(price as bigint)} ETH)</span>:null}</div>
      <label style={s.label}>Token URI / URL</label>
      <input style={s.input} value={uri} onChange={e=>setUri(e.target.value)} placeholder="ipfs://... or https://..."/>
      <button style={{...s.btn,opacity:isPending||isLoading?.6:1}} disabled={isPending||isLoading} onClick={()=>writeContract({address:ADDR,abi:ABI,functionName:"mint",args:[uri],value:price as bigint??parseEther("0.001")})}>
        {isPending||isLoading?"Minting...":"Mint NFT 🖼️"}
      </button>
    </div>}
    </>)}
  </div>);
}