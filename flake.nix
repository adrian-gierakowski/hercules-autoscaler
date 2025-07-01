{
  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs/nixos-unstable";
    yarnpnp2nix.url = "github:adrian-gierakowski/yarnpnp2nix";
    treefmt-nix.url = "github:numtide/treefmt-nix";
    treefmt-nix.inputs.nixpkgs.follows = "nixpkgs";
  };

  outputs =
    {
      self,
      nixpkgs,
      yarnpnp2nix,
      treefmt-nix,
    }:
    let
      forAllSystems = nixpkgs.lib.genAttrs [
        "x86_64-linux"
        "aarch64-linux"
      ];

      pkgsFor = forAllSystems (
        system:
        import nixpkgs {
          inherit system;
          overlays = [
            yarnpnp2nix.overlays.default
          ];
        }
      );
    in
    {
      devShells = forAllSystems (
        system:
        let
          pkgs = pkgsFor.${system};
        in
        {
          default = pkgs.mkShell {
            nativeBuildInputs = with pkgs; [
              nodejs
              yarnBerry
              self.packages.${system}.treefmt
            ];
            env.YARN_PLUGINS = pkgs.yarn-plugin-yarnpnp2nix;
          };
        }
      );
      packages = forAllSystems (
        system:
        let
          pkgs = pkgsFor.${system};
        in
        {
          treefmt =
            let
              inherit (pkgs) lib;
              treefmt-eval = (import treefmt-nix).evalModule pkgs {
                programs.nixfmt.enable = true;
                # programs.nixfmt.srict = true;
                programs.dprint.enable = true;
                programs.dprint = {
                  includes = lib.mkForce [
                    "**/*.ts"
                    "**/*.mts"
                    "**/*.mjs"
                    "**/*.js"
                  ];
                };
                programs.dprint.settings = {
                  plugins = [
                    "https://plugins.dprint.dev/typescript-0.94.0.wasm"
                  ];
                  indentWidth = 2;
                  lineWidth = 100;
                  incremental = true;
                  useTabs = false;
                  typescript = {
                    "arrowFunction.useParentheses" = "preferNone";
                    "binaryExpression.linePerExpression" = true;
                    "enumDeclaration.memberSpacing" = "newLine";
                    "jsx.quoteStyle" = "preferSingle";
                    lineWidth = 80;
                    "memberExpression.linePerExpression" = true;
                    nextControlFlowPosition = "sameLine";
                    quoteProps = "asNeeded";
                    quoteStyle = "preferSingle";
                    semiColons = "asi";
                  };
                };
                settings.formatter = {
                  nixfmt = {
                    excludes = [
                      "**/yarn-manifest.nix"
                    ];
                    includes = lib.mkForce [
                      "*.nix"
                    ];
                  };
                  dprint = {
                    includes = lib.mkForce [
                      "*.ts"
                      "*.mts"
                      "*.mjs"
                      "*.js"
                    ];
                  };
                };
                settings.global = {
                  on-unmatched = "info";
                  excludes = [
                    "**/.git*"
                    "**/.pnp.*"
                    "*.js"
                    "*.json"
                    "*.md"
                    "*.sh"
                    "*.txt"
                    "*.yml"
                    "**/.yarn/**"
                    ".envrc"
                    "LICENSE"
                    "package.json"
                    "test/workspace/*"
                    "yarn-manifest.nix"
                  ];
                };
              };
            in
            treefmt-eval.config.build.wrapper;
        }
      );
    };
}
