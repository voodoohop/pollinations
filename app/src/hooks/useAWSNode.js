import Debug from "debug";
import { useState } from "react";


const debug = Debug("useAWSNode");


const publish = (...args) => {
    debug("publish", ...args);
}

const useAWSNode = () => {

    const [nodeID, setNodeID] = useState(null);

    const node = { connected: true, publish, nodeID: nodeID };
    
    // useEffect(() => {
    //     let nodeID = node?.nodeID

    //     if (!nodeID) return

    //     // Publisher
    //     debug("nodeID change to", nodeID, "creating publisher")
    //     const { publish, close: closePub } = publisher(nodeID, "/input")
    //     updateNode({ publish, close })
    //     //close()

    //     // Update
    //     debug("nodeID changed to", nodeID, ". (Re)subscribing")
    //     const closeSub = subscribeCID(nodeID, "/output", contentID => updateNode({ contentID }), heartbeat => {
    //         debug("hearbeat state", heartbeat)
    //         const connected = heartbeat && heartbeat.alive
    //         updateNode({ connected })
    //     })

    //     return () => {
    //         closeSub()
    //         closePub()
    //     }

    // }, [node.nodeID])

    const overrideContentID = () => console.error("overrideContentID not implemented")
    const overrideNodeID = () => console.error("overrideNodeID not implemented")

    return { node, overrideContentID, overrideNodeID }

};

export default useAWSNode
