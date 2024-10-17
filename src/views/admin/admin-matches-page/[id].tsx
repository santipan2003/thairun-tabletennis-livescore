import { NextPage } from "next";
import Layout from "@/pages/components/Layout";
import MatchList from "./components/MatchList";

export const MatchInTournament: NextPage = () => {
  return (
    <Layout>
      <div>
        <MatchList />
      </div>
    </Layout>
  );
};

export default MatchInTournament;
