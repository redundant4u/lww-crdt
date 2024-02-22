import { NextPage } from "next";

import CRDT from "@components/CRDT";

const AlicePage: NextPage = () => {
    return <CRDT isBob={false} />;
};

export default AlicePage;
