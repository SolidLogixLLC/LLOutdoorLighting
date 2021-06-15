import "../sass/main.scss";
import searchInSmartyAddress from "./smarty-address";

searchInSmartyAddress();

$("#design").click(function () {
  $("html, body").animate(
    {
      scrollTop: $("#designandinstall").offset().top,
    },
    2000
  );
});

$("#lighting").click(function () {
  $("html, body").animate(
    {
      scrollTop: $("#LightingDesign").offset().top,
    },
    2000
  );
});

$("#lighting-upgrades").click(function () {
  $("html, body").animate(
    {
      scrollTop: $("#LightingUpgrades").offset().top,
    },
    2000
  );
});

$("#lighting-automation").click(function () {
  $("html, body").animate(
    {
      scrollTop: $("#LightingAutomation").offset().top,
    },
    2000
  );
});

$("#repair").click(function () {
  $("html, body").animate(
    {
      scrollTop: $("#RepairAndMaintenance").offset().top,
    },
    2000
  );
});

$("#commercial-services").click(function () {
  $("html, body").animate(
    {
      scrollTop: $("#CommercialServices").offset().top,
    },
    2000
  );
});
