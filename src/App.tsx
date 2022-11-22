import { ChangeEvent, useState } from "react";

import "./App.css";

const styles = {
  container: {
    margin: 0,
    padding: 0,
    maxWidth: "100vw",
    maxHeight: "100vh",
    overflow: "hidden",
  },
  embed: {
    backgroundColor: "#7159C1",
    // width: "auto",
    // height: "auto",
    // height: "100%",
    // maxWidth: "80vw",
    // maxHeight: "70vh",
    margin: `${8 / 16}rem auto`,
    padding: `${4 / 16}rem`,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    // objectFit: "scale-down",
  },
};

const App = () => {
  const [src, setSrc] = useState("");
  const [type, setType] = useState("");

  const handleFiles = (evt: ChangeEvent<HTMLInputElement>) => {
    if (!evt.target.files) return;

    const fileReader = new FileReader();
    fileReader.onloadend = () => {
      const b64 = fileReader.result?.toString() || "";
      const [data] = b64.split(/,/);
      const matchRegex = data.match(/:(.*?);/);
      if (!matchRegex) return;
      const [_, mimeType] = matchRegex;
      setSrc(b64);
      // setType(mimeType);
      console.log(b64.substring(0, 100));
      console.log(mimeType);
      const t1 = mimeType.split(".");
      console.log(t1);
      setType(t1[0]);
    };

    fileReader.readAsDataURL(evt.target.files[0]);
  };

  return (
    <div
      style={{
        margin: 0,
        padding: 0,
        maxWidth: "100vw",
        maxHeight: "100vh",
        overflow: "hidden",
      }}
    >
      <h1>Hello World</h1>
      <input type="file" onChange={handleFiles} />
      <br />
      {/* <embed src={src} type={type} style={styles.embed} hidden /> */}
      <object data={src} type={type}></object>
    </div>
  );
};

export default App;
