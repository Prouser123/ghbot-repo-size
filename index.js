const rs = require("reposize");
const pretty = require("pretty-bytes");

function createChecks({ context, params, head_sha, head_rs, base_rs, isPR }) {
  // Create the checks
  context.github.checks.create({
    owner: params.owner,
    repo: params.repo,
    name: "size/diff",
    head_sha,
    status: "completed",
    conclusion: "neutral",
    output: {
      title: `[${pretty(head_rs - base_rs, { signed: true })}]`,
      summary: isPR
        ? "This is the difference in file size between the HEAD of this branch and the base branch. (the one you are merging into)"
        : "This is the difference in file size between this commit and the previous commit."
    }
  });

  context.github.checks.create({
    owner: params.owner,
    repo: params.repo,
    name: "size/size",
    head_sha,
    status: "completed",
    conclusion: "neutral",
    output: {
      title: `${pretty(head_rs)} (was ${pretty(base_rs)})`,
      summary: "This is the new file size of your repository after this commit."
    }
  });
}

/**
 * This is the main entrypoint to your Probot app
 * @param {import('probot').Application} app
 */
module.exports = app => {
  // Your code here
  app.log("Application loaded!");

  app.on("push", async context => {
    const base_sha = context.payload.before;
    const sha = context.payload.after;
    const params = context.repo();

    if (base_sha != "0000000000000000000000000000000000000000") {
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

      createChecks({
        context,
        params,
        head_sha: sha,
        head_rs,
        base_rs,
        isPR: false
      });
    }
  });

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

    createChecks({
      context,
      params,
      head_sha: sha,
      head_rs,
      base_rs,
      isPR: true
    });
    return;
  });
};
