### **1\. El Diccionario Financiero**

* **FeeSchedule (El Plan):** Es la "plantilla". Dice: "Todos los lunes cobraremos $100". No es dinero aún, es una instrucción.  
* **Charge (La Deuda):** Es la factura. Cuando el plan se ejecuta, crea un Charge para cada casa. Es lo que el residente **debe**.  
* **Payment (El Dinero Físico):** Es el comprobante. El residente llega con un ticket de banco. Representa que el dinero **entró** a la cuenta.  
* **PaymentApplication (El Pegamento):** Une el pago con la deuda. Un pago de $500 podría pagar 2 Charges de $250. Esta tabla dice qué pago liquidó qué deuda.  
* **Expense (La Salida):** Es el registro detallado de un gasto (Luz, proveedores).  
* **Transaction (El Libro Diario):** Es el **único** lugar donde se mueve el balance. Todo Payment (entrada) y todo Expense (salida) genera una Transaction.

### **2\. ¿Cuándo se usa cada una?**

| **Acción** | **Tablas Afectadas** | **¿Qué pasa?** |

| **Se llega la fecha de cobro** | Charge | Se genera la deuda en la cuenta del residente. |

| **Residente paga en el banco** | Payment \+ PaymentApplication \+ Transaction | Entra dinero, se mata la deuda y se registra en el libro diario. |

| **Pagas la luz del parque** | Expense \+ Transaction | Se registra el detalle del gasto y sale dinero del libro diario. |

| **Donativo extraordinario** | Transaction | Entra dinero directamente al libro diario (sin deuda previa). |

### **3\. El Libro Diario (Tu vista actual)**

La vista que diseñamos consulta principalmente **Transaction**. Si la transacción viene de un pago, puedes saltar a Payment para ver el ticket. Si viene de un gasto, saltas a Expense para ver la categoría.