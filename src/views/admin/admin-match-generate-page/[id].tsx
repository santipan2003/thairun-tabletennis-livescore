import { NextPage } from "next";
import Layout from "@/pages/components/Layout";
import AddMatch from "./components/AddMatch";

export const MatchGenerateInTournament: NextPage = () => {
  return (
    <Layout>
      <div>
        <AddMatch />
      </div>
    </Layout>
  );
};

export default MatchGenerateInTournament;
