import debug from "debug";
import { useCallback } from "react";
import { Navigate, Route, Routes, useParams } from "react-router-dom";

import useIPFS from "../hooks/useIPFS";
import useIPFSWrite from "../hooks/useIPFSWrite";
import Create from "../pages/Create";
import ResultViewer from "../pages/ResultViewer";

const ModelRoutes = ({ node, navigateToNode, overrideContentID }) => {
    const { contentID } = useParams();

    const ipfs = useIPFS(contentID);

    const dispatchInput = useIPFSWrite(ipfs, node)

    const dispatch = useCallback(async inputs => {
        debug("dispatching inputs", inputs)
        const contentID = await dispatchInput(inputs)
        debug("dispatched Form")
        if (overrideContentID)
            overrideContentID(contentID)
        navigateToNode()
    }, [ipfs?.input, dispatchInput])

    return (
        <Routes>
            <Route index element={<Navigate replace to="view" />} />
            <Route path='view' element={<ResultViewer ipfs={ipfs} />} />
            <Route path='create' element={<Create ipfs={ipfs} node={node} dispatch={dispatch} />} />
        </Routes>
    )
}

export default ModelRoutes