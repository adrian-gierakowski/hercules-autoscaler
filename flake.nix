{
  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs/nixos-unstable";
    yarnpnp2nix.url = "github:adrian-gierakowski/yarnpnp2nix";
  };

  outputs =
    {
      self,
      nixpkgs,
      yarnpnp2nix,
    }: let
      forAllSystems = nixpkgs.lib.genAttrs ["x86_64-linux" "aarch64-linux"];

      pkgsFor = forAllSystems (system: import nixpkgs {
        inherit system;
        overlays = [
          yarnpnp2nix.overlays.default
        ];
      });
    in {
      devShells = forAllSystems (system: let pkgs = pkgsFor.${system}; in {
        default = pkgs.mkShell {
          nativeBuildInputs = with pkgs; [
            nodejs
            yarnBerry
          ];
          env.YARN_PLUGINS = pkgs.yarn-plugin-yarnpnp2nix;
        };
      });
    };
}
