{
  inputs = {
    utils.url = "github:numtide/flake-utils";
    nixpkgs.url = "github:nixos/nixpkgs/nixos-unstable";
    yarnpnp2nix.url = "github:adrian-gierakowski/yarnpnp2nix";
  };

  outputs =
    {
      self,
      nixpkgs,
      utils,
      yarnpnp2nix,
    }:
    utils.lib.eachDefaultSystem (
      system:
      let
        pkgs = import nixpkgs {
          inherit system;
          overlays = [ yarnpnp2nix.overlays.default ];
        };
      in
      {
        devShell = pkgs.mkShell {
          YARN_PLUGINS = pkgs.yarn-plugin-yarnpnp2nix;
          nativeBuildInputs = with pkgs; [
            nodejs
            yarnBerry
          ];
        };
      }
    );
}
