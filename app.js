import express, { urlencoded, json } from "express";
import Cors from "cors";
import path from "path";
import { connect } from "mongoose";
import UserModel from "./api/user-management/model/user_model.js";
import PermissionModel from "./api/user-management/model/permission_model.js";
import RoleModel from "./api/user-management/model/role_model.js";
import CustomStrings from "./api/common/custom_strings.js";
const app = express();
import userRoute from "./api/user-management/route/user_route.js";
import hotelRoute from "./api/modules/hotel/route/hotel-route.js";
import countryRoute from "./api/modules/country/route/country-route.js";
import cityRoute from "./api/modules/country/route/city-route.js";
import clientAgentRoute from "./api/modules/client-agent/route/client-agent-route.js";
import queryRoute from "./api/modules/query/route/query-route.js";
import vehicleRoute from "./api/modules/vehicle/route/vehicle-route.js";
import invoiceRoute from "./api/modules/invoice/route/invoice-route.js";
import voucherRoute from "./api/modules/voucher/route/voucher_route.js";
import paymentDetailsRoute from "./api/modules/payment-details/route/payment-details-route.js";
import bcrypt from "bcrypt";
import compression from "compression";
app.use(compression());
app.use(urlencoded({ extended: true }));
app.use(json());
app.use(Cors());
app.use("/upload", express.static("upload"));

import { config } from "dotenv";
config();

connect(process.env.MONGO_URL_ATLAS)
  .then(async () => {
    console.log(CustomStrings.CONNECTED_TO_MONGODB);

    let allRoutesAndMethodMap = new Map();

    function getRoutesStack(path, layer) {
      if (layer.route) {
        layer.route.stack.forEach(
          getRoutesStack.bind(null, path.concat(split(layer.route.path)))
        );
      } else if (layer.name === "router" && layer.handle.stack) {
        layer.handle.stack.forEach(
          getRoutesStack.bind(null, path.concat(split(layer.regexp)))
        );
      } else if (layer.method) {
        //console.log("data :", path.concat(split(layer.regexp)).filter(Boolean));
        let routeFullPath = path
          .concat(split(layer.regexp))
          .filter(Boolean)
          .join("/");
        allRoutesAndMethodMap.set(
          "/" + routeFullPath,
          layer.method.toUpperCase()
        );
        // console.log(
        //   "%s /%s",
        //   layer.method.toUpperCase(),
        //   path.concat(split(layer.regexp)).filter(Boolean).join("/")
        // );
      }
    }

    function split(thing) {
      if (typeof thing === "string") {
        return thing.split("/");
      } else if (thing.fast_slash) {
        return "";
      } else {
        var match = thing
          .toString()
          .replace("\\/?", "")
          .replace("(?=\\/|$)", "$")
          .match(
            /^\/\^((?:\\[.*+?^${}()|[\]\\\/]|[^.*+?^${}()|[\]\\\/])*)\$\//
          );
        return match
          ? match[1].replace(/\\(.)/g, "$1").split("/")
          : "<complex:" + thing.toString() + ">";
      }
    }

    app._router.stack.forEach(getRoutesStack.bind(null, []));

    function splitWithUpperCase(str) {
      return str.split(/(?=[A-Z])/);
    }

    function capitalizeFirstLetter(string) {
      return string.charAt(0).toUpperCase() + string.slice(1);
    }

    for (let routePath of allRoutesAndMethodMap.keys()) {
      if (routePath !== "/") {
        let method = allRoutesAndMethodMap.get(routePath);
        let routeName = "";
        let routeSplits = routePath.split("/");
        if (
          routeSplits[2] !== null &&
          routeSplits[2] !== "" &&
          routeSplits !== undefined
        ) {
          const routeNameSplits = splitWithUpperCase(routeSplits[2]);
          routeName = routeNameSplits.join(" ");
          routeName = capitalizeFirstLetter(routeName);
        }
        let finalPermissionData = {
          path: routePath,
          method: method,
          name: routeName,
        };
        const foundPermission = await PermissionModel.findOne({
          path: routePath,
        });
        if (!foundPermission) {
          let permission = new PermissionModel(finalPermissionData);
          await permission.save();
          //console.log("permisson recent saved: ", permission);
        } else {
          //if permission found but method donot match
          if (method !== foundPermission.method) {
            const newPerm = new PermissionModel(finalPermissionData);
            const deletedPerm = await foundPermission.delete();
            // console.log('delted Perm: ', deletedPerm);
            await newPerm.save();
            //console.log('found deleted and created recent saved: ', newPerm);
          }
        }
      }
    }

    try {
      if (
        !process.env.MAIN_EMAIL ||
        !process.env.MAIN_ROLE ||
        !process.env.MAIN_PASSWORD ||
        !process.env.MAIN_MOBILE ||
        !process.env.MAIN_COUNTRY_CODE ||
        !process.env.MAIN_USER_TYPE
      ) {
        throw new Error(CustomStrings.ENVIRONMENT_VARIABLES_NOT_DEFINED);
      }

      const existedSuperAdminUser = await UserModel.findOne({
        email: process.env.MAIN_EMAIL,
      });

      if (!existedSuperAdminUser) {
        const allPerms = await PermissionModel.find();
        if (allPerms.length > 0) {
          let superAdminRole = await RoleModel.findOne({
            name: process.env.MAIN_ROLE,
          });

          if (!superAdminRole) {
            superAdminRole = await RoleModel.create({
              name: process.env.MAIN_ROLE,
              permissions: allPerms,
            });
          }

          const passwordHash = await bcrypt.hash(process.env.MAIN_PASSWORD, 10);
          await UserModel.create({
            fullName: process.env.MAIN_USER,
            email: process.env.MAIN_EMAIL,
            mobileNumber: process.env.MAIN_MOBILE,
            countryCode: process.env.MAIN_COUNTRY_CODE,
            password: passwordHash,
            isVerified: true,
            role: superAdminRole,
            userType: process.env.MAIN_USER_TYPE,
          });

          console.log(CustomStrings.SUPER_ADMIN_CREATED_SUCCESSFULLY);
        }
      } else {
        console.log(CustomStrings.SUPER_ADMIN_ALREADY_EXISTS);
      }
    } catch (error) {
      console.error(CustomStrings.ERROR_INITIALIZING_SUPER_ADMIN, error);
    }
  })
  .catch((err) => console.error(CustomStrings.CONNECTION_ERROR, err));

//Routes
app.use("/user", userRoute);
app.use("/api", hotelRoute);
app.use("/api", countryRoute);
app.use("/api", cityRoute);
app.use("/api", vehicleRoute);
app.use("/api", clientAgentRoute);
app.use("/api", queryRoute);
app.use("/api", invoiceRoute);
app.use("/api", voucherRoute);
app.use("/api", paymentDetailsRoute);

export default app;
