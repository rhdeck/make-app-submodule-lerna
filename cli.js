#!/usr/bin/env node
const msm = require("manage-submodules");
const yarnif = require("yarnif");
const glob = require("glob");
const fs = require("fs");
const Path = require("path");
const rimraf = require("rimraf");
const basedir = process.cwd();
msm.walkAll(thisdir => {
  yarnif.exec("lerna", ["bootstrap"]);
  yarnif.exec("lerna", ["run", "build"]);
  yarnif.exec("lerna", ["run", "link"]);
  const lernapath = fs.readFileSync("lerna.json");
  const lernapackage = JSON.parse(lernapath);
  if (lernapackage) {
    const thisdir = process.cwd();
    const packages = lernapackage.packages || [];
    packages.forEach(g => {
      glob.sync(g).forEach(packagepath => {
        const packageobj = require(Path.join(packagepath, "package.json"));
        const name = packageobj.name;
        const targetdir = Path.join(basedir, "node_modules", name);
        fs.mkdir(Path.dirname(targetdir));
        fs.unlinkSync(targetdir);
        rimraf.sync(targetdir);
        fs.symlinkSync(packagepath, targetdir);
      });
    });
    //Now make my symlink
  }
});
