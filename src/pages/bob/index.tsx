import { NextPage } from "next";

import CRDT from "@components/CRDT";

const BobPage: NextPage = () => {
    return <CRDT isBob={true} />;
};

export default BobPage;
