package com.shelf.sync.dto;

import java.math.BigDecimal;

public class PayFineRequest {

    private BigDecimal amount;
    private String paymentMethod = "CASH";

    public PayFineRequest() {
    }

    public PayFineRequest(BigDecimal amount, String paymentMethod) {
        this.amount = amount;
        this.paymentMethod = paymentMethod;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public String getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(String paymentMethod) {
        this.paymentMethod = paymentMethod;
    }
}
