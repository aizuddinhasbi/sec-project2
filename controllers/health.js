function getHealth(req, res) {
  const data = {
    status: "OK",
    message: "Get Health Check Passed",
  };
  return res.status(200).json(data);
}

function postHealth(req, res) {
  const body = req.body;
  const data = {
    status: "ok",
    message: "Post Health Check Passed",
    body: body,
  };
  return res.status(200).json(data);
}

const healthController = {
  getHealth,
  postHealth,
};

export default healthController;
