jQuery(document).ready(function ($) {
  $('.generic-filters .toggle').on('click', function (e) {
    e.preventDefault();
    $(this).siblings('.toggle-list').slideToggle();
  });
  $(window).scroll(function () {
    if ($(this).scrollTop() > 700) {
      $('.fixed-sticky.desktop').addClass('visible');
    } else {
      $('.fixed-sticky.desktop').removeClass('visible');
    }
  });
  $(window).scroll(function () {
    if ($(this).scrollTop() > 1200) {
      $('.fixed-sticky.mobile').addClass('visible');
    } else {
      $('.fixed-sticky.mobile').removeClass('visible');
    }
  });

  // Comparison product page scripts
  var nativePetListItems = '';
  var competitorListItems = '';
  $('.product-showcase').hide(); //Hide all product images (redundant check if style display none fails.)


  //On native pet product select
  $('#selected_native_product').on('change', function(){
    // reset comparison section
    // $(this).parents('.product-selection').siblings('.product-showcase').hide(); //hide all product-showcase that are in same parent as this select box.
    $('.product-showcase').hide();
    $('#selected_competitor_product option:selected').prop('selected', false);
    $('#table-content tr').remove();

    var selectedSku = $('#selected_native_product option:selected').data('product-sku'); //fetch selected option
    var selectedShowcase = $(this).parents('.product-selection').siblings('[data-product-sku="' + selectedSku + '"]');

    selectedShowcase.show(); //display only product image which is selected

    nativePetListItems = selectedShowcase.data('list-items');// assign list items for native pet product

    // Update selection options in competitor box based on selecte product sku.
    $('#selected_competitor_product option').each(function(index){
      var option =  $(this);
			if (option.data('product-sku') != selectedSku){
        if (index > 0) {
          option.hide();
        }
			}else{
				option.show();
			}
		});
  });

  // On competitor product selection
  $('#selected_competitor_product').on('change', function(){
    $(this).parents('.product-selection').siblings('.product-showcase').hide(); //hide all product-showcase that are in same parent as this select box.
    var selectedSku = $('#selected_native_product option:selected').data('product-sku');
    var selectedShowcase = $(this).parents('.product-selection').siblings('[data-product-sku="' + selectedSku + '"]');
    selectedShowcase.show(); //display only product image which is selected

    competitorListItems = selectedShowcase.data('list-items'); // assign list items for competitor product.

    // populate data in comparison table.
    updateComparisonTable(nativePetListItems,competitorListItems);
  });

  
  // Bundles
  var sideCart = window.sideCart || [];
  $('form.bundle').on('submit', function(e)
  {
    e.preventDefault();
    var items = [];
    $(this).find('input[name*="bundle"]').each(function()
    {
      items.push({
        quantity: 1,
        id: $(this).val()
      });
    });

    sideCart.push('add-item', { items: items });
    sideCart.push('open');
  });
});

function updateComparisonTable(nativePetListItems,competitorListItems) {
  $('#table-content tr').remove();
  var nP_listItems = nativePetListItems;
  var comp_listItems = competitorListItems;

  var NativePet_list = nP_listItems.split('[/list_item]');
  var Competitor_list = comp_listItems.split('[/list_item]');
  var maxSize = Math.max(NativePet_list.length, Competitor_list.length);

  for (var i = 0; i < maxSize; i++) {
    let row = $('<tr>');
    // native pet row html generate
    if (NativePet_list[i]) {
      var td1 = '<div class="d-flex"> <div class="icon"><img src="//cdn.shopify.com/s/files/1/2715/7980/t/10/assets/icon-check-mark.svg?v=16878072207583194899" alt=""></div><div class="content">'+ NativePet_list[i] +'</div></div>';
    } else {
      var td1 = '';
    }
    row.append($('<td>').html(td1));

    //Competitor row html generate
    if (Competitor_list[i]) {
      var td2 = '<div class="d-flex"> <div class="icon"> <img src="//cdn.shopify.com/s/files/1/2715/7980/t/10/assets/icon-cross.svg?v=653247290465821328" alt=""></div> <div class="content">'+ Competitor_list[i] +'</div></div>';
    } else {
      var td2 = '';
    }
    row.append($('<td>').html(td2));

    $('#table-content').append(row);
  }
}


$(function() {
	// Active the first thumb & panel
	$(".tabs-thumb:first-child").addClass("is-active").closest(".tabs").find(".tabs-panel:first-child").show();
	
	$(".tabs-thumb").click(function() {
		// Cancel the siblings
		$(this).siblings(".tabs-thumb").removeClass("is-active").closest(".tabs").find(".tabs-panel").hide();
		// Active the thumb & panel
		$(this).addClass("is-active").closest(".tabs").find(".tabs-panel").eq($(this).index(".tabs-thumb")).show();
	});
});
