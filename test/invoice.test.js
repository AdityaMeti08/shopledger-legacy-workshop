'use strict';

var test = require('node:test');
var assert = require('node:assert/strict');
var invoice = require('../lib/invoice');
var pricing = require('../lib/pricing');

test('invoice uses the item HSN slab when gstRate is absent', function () {
  var items = [{ id: 1, name: 'Rice', hsn: '1006', price: 100, qty: 1 }];
  var orderTotals = pricing.computeTotals(items, '');
  var invoiceTotals = invoice.computeInvoiceFigures({ items: items });

  assert.equal(orderTotals.tax, 5);
  assert.equal(orderTotals.total, 105);
  assert.equal(invoiceTotals.tax, 5);
  assert.equal(invoiceTotals.cgst, 2.5);
  assert.equal(invoiceTotals.sgst, 2.5);
  assert.equal(invoiceTotals.total, 105);
  assert.equal(invoiceTotals.rows[0].gstPercent, 5);
});

test('invoice applies the configured coupon maximum discount', function () {
  var items = [{ id: 2, name: 'Bulk goods', hsn: '9999', price: 4000, qty: 1 }];
  var orderTotals = pricing.computeTotals(items, 'WHOLESALE15');
  var invoiceTotals = invoice.computeInvoiceFigures({
    items: items,
    coupon: 'WHOLESALE15',
    total: orderTotals.total
  });

  assert.equal(orderTotals.discount, 400);
  assert.equal(orderTotals.tax, 648);
  assert.equal(orderTotals.total, 4248);
  assert.equal(invoiceTotals.discount, 400);
  assert.equal(invoiceTotals.tax, 648);
  assert.equal(invoiceTotals.cgst, 324);
  assert.equal(invoiceTotals.sgst, 324);
  assert.equal(invoiceTotals.total, 4248);
  assert.doesNotMatch(invoice.render({
    id: 7,
    items: items,
    coupon: 'WHOLESALE15',
    total: orderTotals.total
  }), /Accountant Reconciliation Notice/);
});
