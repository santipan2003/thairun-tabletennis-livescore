import { NextPage } from "next";
import Layout from "@/pages/components/Layout";
import AddGroup from "./components/AddGroup";

export const GroupGenerateInTournament: NextPage = () => {
  return (
    <Layout>
      <div>
        <AddGroup />
      </div>
    </Layout>
  );
};

export default GroupGenerateInTournament;
