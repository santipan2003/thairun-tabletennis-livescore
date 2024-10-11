import { NextPage } from "next";
import Layout from "@/pages/components/Layout";
import TournamentList from "./components/TournamentList";

export const Tournament: NextPage = () => {
  return (
    <Layout>
      <div>
        <TournamentList />
      </div>
    </Layout>
  );
};

export default Tournament;
