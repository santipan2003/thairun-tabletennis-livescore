import { NextPage } from "next";
import Layout from "@/pages/components/Layout";
import PlayerListPage from "./components/PlayerList";

export const PlayersInTournament: NextPage = () => {
  return (
    <Layout>
      <div>
        <PlayerListPage />
      </div>
    </Layout>
  );
};

export default PlayersInTournament;
