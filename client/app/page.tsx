import { NextPage } from "next";
import Chat from "@/components/home/connect";



const Home: NextPage<any> = async () => {
  return (
    <>
    <div className="flex justify-center">
      <Chat />
      </div>
    </>
  );
};

export default Home;