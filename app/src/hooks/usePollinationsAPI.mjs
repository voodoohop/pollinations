import Debug from "debug";
import { useState } from 'react';


const debug = Debug("usePollinationsAPI");
// await submitToAWS({...values, seed: Math.floor(Math.random() * 100000)}, MODEL, false, {priority: 1});
export default function usePollinationsAPI() {

    const [isLoading, setIsLoading] = useState(false)
    const [output, setOutput] = useState(null)
    const endpoint_url = "wss://rest.pollinations.ai/ws"


    const submit = (input, model) => { 

        const ws = new WebSocket(endpoint_url)
        ws.onopen = function open() {
            console.log('connected');

            const request = {
                "image": model,
                "input": input
            }
            ws.send(JSON.stringify(request))
            setIsLoading(true)
        }

        ws.onmessage = function incoming({data: str}) {

            // convert data from buffer to string
            console.log("data", str)

            const json = JSON.parse(str);
            const {
                output,
                status
            } = json;
            
            debug("received", output, status)

            setIsLoading(status === "starting" || status === "processing")
            setOutput(_ => output)
        }
    }

    return { submit, isLoading, output }
}