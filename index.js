const rs = require("reposize");
const pretty = require("pretty-bytes");

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
    const base_sha = pr.base.sha;

    const params = context.repo();

    const base_rs = await rs.withKit.GetBytesFromSha(
      context.github,
      params.owner,
      params.repo,
      base_sha
    );

    const head_rs = await rs.withKit.GetBytesFromSha(
      context.github,
      params.owner,
      params.repo,
      sha
    );

    const status = {
      sha,
      context: "size/diff",
      state: "success",
      description: pretty(head_rs - base_rs, { signed: true })
    };

    const status2 = {
      sha,
      context: "size/size",
      state: "success",
      description: `${pretty(head_rs)} (was ${pretty(base_rs)})`
    };

    // Create the status
    context.github.repos.createStatus(context.repo(status));
    context.github.repos.createStatus(context.repo(status2));
    return;
  });
};
