import { NextPage } from "next";
import HomePage from "./components/HomePage";
import Layout from "@/pages/components/Layout";
import MatchCarousel from "../admin-match-page/components/MatchPage";

export const Home: NextPage = () => {
  return (
    <Layout>
      <div>
        <MatchCarousel />
      </div>
    
      <div>
        <HomePage />
      </div>
    </Layout>
  );
};

export default Home;
