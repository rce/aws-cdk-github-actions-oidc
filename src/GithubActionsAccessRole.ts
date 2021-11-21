import cdk = require("@aws-cdk/core")
import iam = require("@aws-cdk/aws-iam")

type GithubActionsAccessRoleProps = {
  roleName: string
  repositories: string[]
}

class GithubActionsAccessRole extends cdk.Construct {
    role: iam.Role

    constructor(scope, cdk.Construct, id: string, props: GithubActionsAccessRoleProps) {
      super(scope, id)

      const connectProvider = new iam.OpenIdConnectProvider(this, "OpenIdConnectProvider", {
        url: "https://token.actions.githubusercontent.com",
        clientIds: ["sts.amazonaws.com"],
        thumbprints: ["a031c46782e6e6c662c2c87c76da9aa62ccabd8e"],
      })

      this.role = new iam.Role(this, "Role", {
        roleName: props.roleName,
        assumedBy: new iam.FederatedPrincipal(
          connectProvider.openIdConnectProviderArn,
          {
            "ForAnyValue:StringLike": {
              "token.actions.githubusercontent.com:sub": props.repositories.map(_ => `repo:${_}:*`)
            }
          },
          "sts:AssumeRoleWithWebIdentity",
        )
    }
}
