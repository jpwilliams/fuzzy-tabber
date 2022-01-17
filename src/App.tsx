import React from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";
import "./global.css";
import { Overlay } from "./Overlay";
import { store } from "./store/store";

const el = document.createElement("div");
el.setAttribute("id", "__fuzzy_tabber_app");

document.documentElement.appendChild(el);

ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <Overlay />
    </Provider>
  </React.StrictMode>,
  el
);
