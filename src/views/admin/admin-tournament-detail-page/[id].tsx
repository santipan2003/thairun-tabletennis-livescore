import { NextPage } from "next";
import Layout from "@/pages/components/Layout";
import TournamentDetail from "./components/TournamentDetail";

export const TournamentDetails: NextPage = () => {
  return (
    <Layout>
      <div>
        <TournamentDetail />
      </div>
    </Layout>
  );
};

export default TournamentDetail;
