import { httpRouter } from "convex/server";
import { editTemplate } from "./chat";

const http = httpRouter();

http.route({ path: "/chat/editTemplate", method: "POST", handler: editTemplate });
http.route({ path: "/chat/editTemplate", method: "OPTIONS", handler: editTemplate });

export default http;
