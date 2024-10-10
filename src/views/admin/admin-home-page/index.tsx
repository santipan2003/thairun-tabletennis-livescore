import { NextPage } from "next";
import HomePage from "./components/HomePage";
import Layout from "@/pages/components/Layout";

export const Home: NextPage = () => {
  return (
    <Layout>
      <HomePage />
    </Layout>
  );
};

export default Home;
