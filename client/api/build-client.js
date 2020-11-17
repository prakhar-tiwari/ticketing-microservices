import axios from "axios";
export default ({ req }) => {
  if (typeof window === "undefined") {
    // on server
    return axios.create({
      baseURL: "http://ingress-nginx-controller.kube-system.svc.cluster.local",
      headers: req.headers,
    });
  } 
  else {
    // on browser

    // not really needed to include baseURL
    return axios.create({
      baseURL: "/",
    });
  }
};
