'use server'
import { NextPage } from "next";
import ChatBox from "@/components/chat/chatbox";

const chatBox:  NextPage = (): JSX.Element => {
  return (
    <>
      <ChatBox /> 
    </>
  );
};

export default chatBox;