import React from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";
import "./global.css";
import { Overlay } from "./Overlay";
import { store } from "./store/store";

const el = document.getElementById("__fuzzy_tabber_app");

ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <Overlay />
    </Provider>
  </React.StrictMode>,
  el
);
