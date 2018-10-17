import C4Framework from "./C4Framework";
import { getControllers } from "c4webservice";

let C4 = new C4Framework();

async function Launch() {
    await C4.init();
    await C4.launch();
    // C4.getDBClient();
}

Launch();
