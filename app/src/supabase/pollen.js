import supabase from "./client.js";
import url from 'url'

export function getAllPollens() {
    return supabase.from("baseapp_pollen").select("*").order("id", {ascending: false}).then(response => {
        return response.data
    })
}

export function createPollen( cid, ipns) {
    return supabase.from("baseapp_pollen").insert([{
//        "search_text": search_text,
//        "inputs": inputs,
//        "outputs": outputs,
//        "model_name": model_name,
        "cid": cid,
        "ipns": ipns,
        "created": new Date(),
        "modified": new Date()
    }]).then(response => {
        return response.data
    })
}

export function updatePollen(id, search_text, inputs, outputs, model_name, cid, ipns) {
    return supabase.from("baseapp_pollen").update([{
        "id": id,
        "search_text": search_text,
        "inputs": inputs,
        "outputs": outputs,
        "model_name": model_name,
        "cid": cid,
        "ipns": ipns,
        "modified": new Date()
    }]).match({"id": id}).then(response => {
        return response.data
    })
}

export function deletePollen(id) {
    return supabase.from("baseapp_pollen").delete().match({"id": id}).then(response => {
        return response.data
    })
}

// if run from command line



if (import.meta.url === url.pathToFileURL(process.argv[1]).href) {
  // module was not imported but called directly
    console.log("cli");

    (async () => {
        await createPollen("1234","abcd")
        const allPollens = await getAllPollens();
        console.log(allPollens);
    })()
}