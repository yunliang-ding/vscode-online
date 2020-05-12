const axios = new XMLHttpRequest();
onmessage = (event) => {
  createModel(event.data)
}
createModel = (path) => {
  axios.open("GET", `/api/file/getfile?path=${path}`, false);
  axios.send();
  const { data, isError } = JSON.parse(axios.responseText)
  if(!isError){
    postMessage(JSON.stringify({
      content: data,
      path
    }))
  }
}
