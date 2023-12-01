/*<!-- SMARTRR_CUSTOMIZED_NO_AUTO_EDIT -->*/
if (typeof window.initSmartrr === "undefined") {

  window.initSmartrr = function (uniqueId) {

    document.addEventListener("DOMContentLoaded", function () {
      if (window.smartrrProductList && window.smartrrProductList[uniqueId]) {
        new UIHandler(window.smartrrProductList[uniqueId]);
      }
    });    

    function UIHandler(productInfo) {
      productInfo.ui = this;
      this.productInfo = productInfo;
      productInfo.logic = new LogicHandler(productInfo);

      this.logic = productInfo.logic;
      this.tagList = this.apiSetupTagList();

      this.$form = this.apiQuerySelectorDataTag(this.tagList.FORM.tag, document, this.tagList.FORM.value);

      productInfo.uiImplementDetectChange(this);

      var that = this;
      /*Handle the group selector. In this case, it is radio input. This is the default case and assumed to be so by the UI Handler.*/
      $(this.$form).find('[data-smartrr-selling-plan-group-input]').on("click", function (ev) {
        that.logic.apiChangeGroup($(ev.currentTarget).val());
      });
    }

    UIHandler.prototype = Object.assign({}, UIHandler.prototype, {
      apiSetupTagList: function () {
        var tagList =
        {
          FORM: {
            tag: 'data-smartrr-form-id',
            value: String(this.productInfo.uniqueId),
          },

          SELLING_PLAN_INPUT: 'data-smartrr-selling-plan-input',
          PURCHASE_OPTIONS: 'data-smartrr-purchase-options',
          NO_PLANS: 'data-smartrr-no-plans',
          SELLING_PLAN_GROUPS: 'data-smartrr-selling-plan-groups',
          SELLING_PLAN_GROUP: 'data-smartrr-selling-plan-group-id',
          SELLING_PLAN_GROUP_INPUT: 'data-smartrr-selling-plan-group-input',
          SELLING_PLAN_GROUP_FREQUENCY_INPUT: 'data-smartrr-selling-plan-select-label-input',
          SELLING_PLAN_GROUP_CONTENT: 'data-smartrr-selling-plan-group-contents',

          PRICING: {
            PRODUCT_ID: 'data-smartrr-product-id',
            SELECTOR: 'data-smartrr-price-style',
            CONSTANT: 'data-smartrr-constant',
            COMPARE: 'data-smartrr-compare-price',
            REGULAR: 'data-smartrr-regular-price',
            SUBSCRIBE: 'data-smartrr-subscribe-price',
            QUANTITY: 'data-use-quantity'
          }
        };
        return tagList;
      },

      apiQuerySelectorDataTag: function (dataTag, parent, value) {
        var selector = '[' + dataTag + ']';
        if (value) {
          selector = '[' + dataTag + '="' + String(value) + '"]';
        }
        return parent ? parent.querySelector(selector) : document.querySelector(selector);
      },

      apiQuerySelectorAllDataTag: function (dataTag, parent, value) {
        var selector = '[' + dataTag + ']';
        if (value) {
          selector = '[' + dataTag + '="' + String(value) + '"]';
        }
        return Array.from(parent ? parent.querySelectorAll(selector) : document.querySelectorAll(selector));
      },

      apiOnPlanChanged: function (currentInfo) {
        $(this.apiQuerySelectorDataTag(this.tagList.SELLING_PLAN_INPUT, this.$form)).val(currentInfo.planId);

        this.productInfo.uiOnPlanChange && this.productInfo.uiOnPlanChange(this, currentInfo);

        this.apiUpdatePrices(currentInfo);
      },

      apiOnGroupChanged: function (currentInfo) {
        var inputs = this.apiQuerySelectorAllDataTag(this.tagList.SELLING_PLAN_GROUP_INPUT, this.$form);

        inputs && inputs.forEach(function (input) {
          if ($(input).val() === currentInfo.groupId) {
            input.checked = true;
          }
        })

        var groups = this.apiQuerySelectorAllDataTag(this.tagList.SELLING_PLAN_GROUP, this.$form);
        var groupContents = this.apiQuerySelectorAllDataTag(this.tagList.SELLING_PLAN_GROUP_CONTENT, this.$form);

        var that = this;
        groupContents.forEach(function (group) {
          var groupId = $(group).attr(that.tagList.SELLING_PLAN_GROUP_CONTENT);
          if (groupId === currentInfo.groupId) {
            that.apiShow(group);
          }
          else {
            that.apiHide(group);
          }
        });

        groups.forEach(function (group) {
          var groupId = $(group).attr(that.tagList.SELLING_PLAN_GROUP);
          if (groupId === "") { return; }
          var spa = that.logic.apiGetAnySellingPlanAllocationByVariantGroupId(currentInfo.variantId, groupId);
          if (!!spa) {
            that.apiShow(group);
          } else {
            that.apiHide(group);
          }
        })

        this.productInfo.uiOnGroupChange && this.productInfo.uiOnGroupChange(this, currentInfo);

        if (currentInfo.groupId === "") {
          this.logic.apiChangePlan("");
          return;
        }

        if (currentInfo.planId === "") {
          var firstPlan = this.apiGetFirstPlan(currentInfo);
          this.logic.apiChangePlan(firstPlan);
        } else {
          this.logic.apiChangePlan(currentInfo.planId);
        }
      },

      apiOnVariantChanged: function (currentInfo) {
        if (currentInfo.groupId === "") {
          var firstGroup = this.apiGetFirstGroup(currentInfo);
          this.logic.apiChangeGroup(firstGroup);
        } else {
          this.logic.apiChangeGroup(currentInfo.groupId);
        }

        this.productInfo.uiOnVariantChange && this.productInfo.uiOnVariantChange(this, currentInfo);
      },

      apiGetFirstPlan: function (currentInfo) {
        if (currentInfo.groupId === "") {
          return "";
        }

        var plans = this.apiQuerySelectorAllDataTag(this.tagList.SELLING_PLAN_GROUP_FREQUENCY_INPUT, this.$form, currentInfo.groupId);

        return plans.length ? $(plans[0]).val() : "";
      },

      apiGetFirstGroup: function (currentInfo) {
        var allGroups = this.apiQuerySelectorAllDataTag(this.tagList.SELLING_PLAN_GROUP, this.$form);

        var that = this;
        groups = allGroups.filter(function (group) {
          var groupId = $(group).attr(that.tagList.SELLING_PLAN_GROUP);
          if (groupId === "") {
            return true;
          }
          var spa = that.logic.apiGetAnySellingPlanAllocationByVariantGroupId(currentInfo.variantId, groupId);
          return !!spa;
        });

        return groups.length ? $(groups[0]).attr(this.tagList.SELLING_PLAN_GROUP) : "";
      },

      apiHide: function ($el) {
        if ($el) {
          $el.classList.add("hide");
        }
      },

      apiShow: function ($el) {
        if ($el) {
          $el.classList.remove("hide");
        }
      },

      apiUpdatePrices: function (currentInfo) {
        /*
          PRICING: {
            PRODUCT_ID: 'data-smartrr-product-id',
            SELECTOR: 'data-smartrr-price-style',
            CONSTANT: 'data-smartrr-constant',
            REGULAR: 'data-smartrr-regular-price',
            SUBSCRIBE: 'data-smartrr-subscribe-price',
          }
        */
        var that = this;

        var $pricedivs = this.apiQuerySelectorAllDataTag(this.tagList.PRICING.SELECTOR);
        $pricedivs = $pricedivs.filter(function ($div) {
          return String($($div).attr(that.tagList.PRICING.PRODUCT_ID)) === String(that.productInfo.uniqueId);
        })

        $pricedivs.forEach(function ($div) {
          var jdiv = $($div);
          var style = jdiv.attr(that.tagList.PRICING.SELECTOR);
          var constant = jdiv.attr(that.tagList.PRICING.CONSTANT);
          var regular = that.apiQuerySelectorDataTag(that.tagList.PRICING.REGULAR, $div);
          var subscribe = that.apiQuerySelectorDataTag(that.tagList.PRICING.SUBSCRIBE, $div);
          var compare = that.apiQuerySelectorDataTag(that.tagList.PRICING.COMPARE, $div);

          var useQuantity = jdiv.attr(that.tagList.PRICING.QUANTITY);

          var qty = Number(useQuantity ? that.productInfo.uiGetQuantity(that) : 1);

          $(compare).text(that.logic.apiGetComparePrice(qty));
          that.apiHide(compare);

          switch (style) {
            case "original":
              that.apiHide(regular);
              $(subscribe).text(that.logic.apiGetDiscountPrice(currentInfo.variantId, "", "", qty));
              break;
            case "strike":
            case "strike-compare":
              if (currentInfo.groupId === "") {
                if (style.includes("compare") && that.logic.apiShowComparePrice()) {
                  that.apiShow(compare);
                }
                if (constant) {
                  $(regular).text(that.logic.apiGetRegularPrice(currentInfo.variantId, constant, "", qty));
                  $(subscribe).text(that.logic.apiGetDiscountPrice(currentInfo.variantId, constant, "", qty));
                  that.apiShow(regular);
                } else {
                  that.apiHide(regular);
                  $(subscribe).text(that.logic.apiGetDiscountPrice(currentInfo.variantId, "", "", qty));
                }
              }
              else {
                if (constant) {
                  if (constant === currentInfo.groupId) {
                    $(regular).text(that.logic.apiGetRegularPrice(currentInfo.variantId, currentInfo.groupId, currentInfo.planId, qty));
                    $(subscribe).text(that.logic.apiGetDiscountPrice(currentInfo.variantId, currentInfo.groupId, currentInfo.planId, qty));
                  }
                  else {
                    $(regular).text(that.logic.apiGetRegularPrice(currentInfo.variantId, constant, "", qty));
                    $(subscribe).text(that.logic.apiGetDiscountPrice(currentInfo.variantId, constant, "", qty));
                  }
                }
                else {
                  $(regular).text(that.logic.apiGetRegularPrice(currentInfo.variantId, currentInfo.groupId, currentInfo.planId, qty));
                  $(subscribe).text(that.logic.apiGetDiscountPrice(currentInfo.variantId, currentInfo.groupId, currentInfo.planId, qty));
                }
                that.apiShow(regular);
              }
              break;
            case "overwrite":
            case "overwrite-compare":
              that.apiHide(regular);
              if (currentInfo.groupId === "") {
                if (style.includes("compare") && that.logic.apiShowComparePrice()) {
                  that.apiShow(compare);
                }
                if (constant) {
                  $(subscribe).text(that.logic.apiGetDiscountPrice(currentInfo.variantId, constant, "", qty));
                }
                else {
                  $(subscribe).text(that.logic.apiGetDiscountPrice(currentInfo.variantId, "", "", qty));
                }
              }
              else {
                if (constant) {
                  if (constant === currentInfo.groupId) {
                    $(subscribe).text(that.logic.apiGetDiscountPrice(currentInfo.variantId, currentInfo.groupId, currentInfo.planId, qty));
                  } else {
                    $(subscribe).text(that.logic.apiGetDiscountPrice(currentInfo.variantId, constant, "", qty));
                  }
                }
                else {
                  $(subscribe).text(that.logic.apiGetDiscountPrice(currentInfo.variantId, currentInfo.groupId, currentInfo.planId, qty));
                }
              }
              break;
          }
        });
      }
    });

    function LogicHandler(productInfo) {
      this.ui = productInfo.ui;
      this.productInfo = productInfo;

      this.current = {
        variantId: "",
        groupId: "",
        planId: "",
      };
    }

    LogicHandler.prototype = Object.assign({}, LogicHandler.prototype, {
      apiGetCurrentCopy: function () {
        return JSON.parse(JSON.stringify(this.current));
      },

      apiGetVariants: function () {
        return this.productInfo.product.variants;
      },

      apiGetVariantByName: function (name) {
        return this.apiGetVariants().find(function (variant) {
          return variant.title === name;
        });
      },

      apiGetVariantById: function (id) {
        return this.apiGetVariants().find(function (variant) {
          return String(variant.id) === String(id);
        });
      },

      apiGetSellingPlanGroups: function () {
        var spg = this.productInfo.product.selling_plan_groups;
        if (spg && spg.length > 0) {
          return spg.filter(function (group) {
            return group.app_id === "4836205" && !group.name.includes("hidden");
          });
        }
        return undefined;
      },

      apiGetSellingPlanGroupById: function (id) {
        var groups = this.apiGetSellingPlanGroups();
        if (groups) {
          return groups.find(function (group) {
            return String(group.id) === String(id);
          });
        }
        return undefined;
      },

      apiGetSellingPlansByGroupId: function (groupId) {
        var group = this.apiGetSellingPlanGroupById(groupId);
        if (group) {
          return group.selling_plans;
        }
        return undefined;
      },

      apiGetSellingPlanById: function (groupId, sellingPlanId) {
        var plans = this.apiGetSellingPlansByGroupId(groupId);
        if (plans) {
          plans.find(function (plan) {
            return String(plan.id) === String(sellingPlanId)
          });
        }
      },

      apiGetSellingPlanAllocationsByVariantId: function (variantId) {
        var variant = this.apiGetVariantById(variantId);
        if (variant) {
          return variant.selling_plan_allocations;
        }
        return undefined;
      },

      apiGetAnySellingPlanAllocationByVariantGroupId: function (variantId, groupId) {
        var spas = this.apiGetSellingPlanAllocationsByVariantId(variantId);
        if (spas) {
          return spas.find(function (plan) {
            return String(plan.selling_plan_group_id) === String(groupId);
          });
        }
        return undefined;
      },

      apiGetSellingPlanAllocationByVariantGroupPlanId: function (variantId, groupId, planId) {
        var spa = this.apiGetSellingPlanAllocationsByVariantId(variantId);
        if (spa) {
          return spa.find(function (plan) {
            return String(plan.selling_plan_group_id) === String(groupId) && String(plan.selling_plan_id) === String(planId);
          });
        }
        return undefined;
      },

      apiChangePlan: function (newplanId) {
        if (newplanId === "" && this.current.groupId === "") {
          this.current.planId = "";
          this.ui.apiOnPlanChanged(this.apiGetCurrentCopy());
          return true;
        }
        if (this.apiGetSellingPlanAllocationByVariantGroupPlanId(this.current.variantId, this.current.groupId, newplanId)) {
          this.current.planId = String(newplanId);
          //DISPATCH: NEW PLAN
          this.ui.apiOnPlanChanged(this.apiGetCurrentCopy());
          return true;
        }
        return false;
      },

      apiChangeGroup: function (newGroupId) {
        if (newGroupId === "") {
          this.current.groupId = "";
          this.current.planId = "";
          this.ui.apiOnGroupChanged(this.apiGetCurrentCopy());
          return true;
        }
        else {
          if (this.apiGetAnySellingPlanAllocationByVariantGroupId(this.current.variantId, newGroupId)) {
            var plans = this.apiGetSellingPlansByGroupId(newGroupId);
            if (plans && plans.length > 0) {
              this.current.groupId = String(newGroupId);
              if (this.apiGetSellingPlanAllocationByVariantGroupPlanId(this.current.variantId, this.current.groupId, this.current.planId)) {
                this.ui.apiOnGroupChanged(this.apiGetCurrentCopy());
              } else {
                this.current.planId = "";
                this.ui.apiOnGroupChanged(this.apiGetCurrentCopy());
              }
              return true;
            }
          }
        }
        return false;
      },

      apiChangeVariant: function (newVariantId) {
        var variant = this.apiGetVariantById(newVariantId);
        if (variant) {
          this.current.variantId = String(newVariantId);
          if (this.apiGetAnySellingPlanAllocationByVariantGroupId(this.current.variantId, this.current.groupId)) {
            this.current.groupId = this.current.groupId;
          } else {
            this.current.groupId = "";
            this.current.planId = "";
          }
          this.ui.apiOnVariantChanged(this.apiGetCurrentCopy());
        }
      },

      apiShowComparePrice: function () {
        var variant = this.apiGetVariantById(this.current.variantId);
        return variant && variant.compare_at_price && (variant.compare_at_price > variant.price);
      },

      apiGetComparePrice: function (_qty) {
        var variant = this.apiGetVariantById(this.current.variantId);
        return this.apiFormatMoney((variant && variant.compare_at_price) ? (variant.compare_at_price * _qty) : undefined)
      },

      apiGetPriceDetails: function (_variantId, _groupId, _planId, _qty) {
        if (_variantId === "") {
          return {
            regular: undefined,
            subscribe: undefined,
          }
        }
        if (_groupId === "") {
          return {
            regular: undefined,
            subscribe: this.apiGetVariantById(_variantId).price * _qty,
          }
        }
        if (_planId === "") {
          var spa = this.apiGetAnySellingPlanAllocationByVariantGroupId(_variantId, _groupId);
          return {
            regular: this.apiGetVariantById(_variantId).price * _qty,
            subscribe: spa ? (spa.price * _qty) : undefined,
          }
        }
        var spa = this.apiGetSellingPlanAllocationByVariantGroupPlanId(_variantId, _groupId, _planId);
        return {
          regular: spa ? (spa.compare_at_price * _qty) : undefined,
          subscribe: spa ? (spa.price * _qty) : undefined,
        }
      },

      apiGetFormattedPriceDetails: function (money) {
        return {
          regular: this.apiFormatMoney(money.regular),
          subscribe: this.apiFormatMoney(money.subscribe),
        }
      },

      apiFormatMoney: function (value) {
        if (value) {
          return Intl.NumberFormat(Shopify.locale, {
            style: "currency",
            currency: Shopify.currency.active,
            minimumFractionDigits: 2,
          }).format(value / 100);
        }
        return '$INVALID';
      },

      apiGetRegularPrice: function (_variantId, _groupId, _planId, _qty) {
        return this.apiGetFormattedPriceDetails(this.apiGetPriceDetails(_variantId, _groupId, _planId, _qty)).regular;
      },

      apiGetDiscountPrice: function (_variantId, _groupId, _planId, _qty) {
        return this.apiGetFormattedPriceDetails(this.apiGetPriceDetails(_variantId, _groupId, _planId, _qty)).subscribe;
      },
    });
  };
}