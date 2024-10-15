import { NextPage } from "next";
import Layout from "@/pages/components/Layout";
import GroupListPage from "./components/Grouplist";

export const GroupInTournament: NextPage = () => {
  return (
    <Layout>
      <div>
        <GroupListPage />
      </div>
    </Layout>
  );
};

export default GroupInTournament;
