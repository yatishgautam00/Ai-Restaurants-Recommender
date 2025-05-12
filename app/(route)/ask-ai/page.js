import Agent from "@/app/_components/Agent";
import React from "react";

function page() {
  return (
    <>
     
      <h3>ASK AI</h3>
      <Agent userName="You" userId='' type='generate'/>
    </>
  );
}

export default page;
