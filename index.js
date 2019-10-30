const rs = require("reposize");

/**
 * This is the main entrypoint to your Probot app
 * @param {import('probot').Application} app
 */
module.exports = app => {
  // Your code here
  app.log("Application loaded!");

  app.on("pull_request", async context => {
    const pr = context.payload.pull_request;
    const sha = pr.head.sha;

    const params = context.repo();

    const status = {
      sha,
      context: "repo/size",
      state: "success",
      description: await rs.withKit.GetPrettyBytesFromSha(
        context.github,
        params.owner,
        params.repo,
        sha
      )
    };

    // Create the status
    return context.github.repos.createStatus(context.repo(status));
  });
};
