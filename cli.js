#!/usr/bin/env node
const msm = require("manage-submodules");
const yarnif = require("yarnif");
const glob = require("glob");
const fs = require("fs");
const Path = require("path");
const rimraf = require("rimraf");
const basedir = process.cwd();
msm.updateAll();
msm.walkAll(thisdir => {
  console.log("Hellot here");
  yarnif.install();
  yarnif.exec(["lerna", "bootstrap"]);
  yarnif.exec(["lerna", "run", "build"]);
  yarnif.exec(["lerna", "run", "link"]);
  const lernapath = fs.readFileSync("lerna.json");
  const lernapackage = JSON.parse(lernapath);
  if (lernapackage) {
    const thisdir = process.cwd();
    const packages = lernapackage.packages || [];
    packages.forEach(g => {
      glob.sync(g).forEach(packagepath => {
        const fullpackagepath = Path.join(thisdir, packagepath);
        const packageobj = require(Path.join(fullpackagepath, "package.json"));
        const name = packageobj.name;
        const targetdir = Path.join(basedir, "node_modules", name);
        const parent = Path.dirname(targetdir);
        if (!fs.existsSync(parent)) fs.mkdirSync(parent);
        if (fs.existsSync(targetdir)) fs.unlinkSync(targetdir);
        rimraf.sync(targetdir);
        fs.symlinkSync(fullpackagepath, targetdir);
      });
    });
    //Now make my symlink
  }
});
