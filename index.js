/** Copyright (c) 2017 Uber Technologies, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

module.exports = robot => {
    
  var number
  robot.on('pull_request', async context => {
      console.log(context.payload.number)
      number = context.payload.number
    }
  )
  
  robot.on('status', async context => {
    const isPr = context.payload.context.slice(-2)
    if(isPr === "pr"){
      merge(context, number)
    }
  }
  );
  
  async function merge(context, number) {
    const { payload } = context
    const { github } = context
    const { sha } = payload
    const { author } = payload.commit.commit
    const commit_message = payload.commit.commit.message
    const commit_title = "Auto commit by probot on successful build"
    const status = payload.state
    
    
    if(status !== "success"){
      return
    }
  
    try {
      console.log(context)
      await github.pullRequests.merge(
        context.repo({
          number:number,
          commit_title: commit_title,
          commit_message: commit_message,
          merge_method: "squash",
        }),
      );
      console.log('got here')
    } catch (err) {
      if (err.code === 405) {
        const message = JSON.parse(err.message).message;
        github.issues.createComment(
          context.issue({
            body: `Failed to merge PR: ${message}`,
          }),
        );
      }
    }
    
  }
};
