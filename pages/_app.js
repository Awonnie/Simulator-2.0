import "@/styles/globals.css";
import Simulator from "components/Simulator";
import Head from "next/head";

export default function App({ Component, pageProps }) {
  return (
    <div className="bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-100 via-blue-300 to-blue-500 h-screen overflow-auto">
      <Head>
        <title>MDP Algorithm Simulator</title>
      </Head>
      <Simulator />
    </div>
  );
}
