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

    // Create the checks
    context.github.checks.create({
      owner: params.owner,
      repo: params.repo,
      name: "size/diff",
      head_sha: sha,
      status: "completed",
      conclusion: "neutral",
      output: {
        title: `[${pretty(head_rs - base_rs, { signed: true })}]`,
        summary:
          "This is the difference in file size between the HEAD of this branch and the base branch. (the one you are merging into)"
      }
    });

    context.github.checks.create({
      owner: params.owner,
      repo: params.repo,
      name: "size/size",
      head_sha: sha,
      status: "completed",
      conclusion: "neutral",
      output: {
        title: `${pretty(head_rs)} (was ${pretty(base_rs)})`,
        summary:
          "This is the new file size of your repository after this commit."
      }
    });
    return;
  });
};
