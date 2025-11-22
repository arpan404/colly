import { PageLayout } from "@/components/PageLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DollarSign, PieChart, TrendingUp, TrendingDown, Plus, Trash2 } from "lucide-react";

const Budget = () => {
  const categories = [
    { name: "Rent", amount: 300, color: "bg-event-blue" },
    { name: "Grocery", amount: 0, color: "bg-event-green" },
    { name: "Miscellaneous", amount: 0, color: "bg-event-orange" },
  ];

  const transactions = [
    { id: 1, category: "Rent", amount: 30, color: "bg-event-blue" },
  ];

  return (
    <PageLayout>
      <div className="p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left sidebar - Categories */}
          <div>
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-primary" />
                Categories
              </h2>
              <div className="space-y-3 mb-6">
                {categories.map((category, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${category.color}`}></div>
                      <span className="text-sm">{category.name}</span>
                    </div>
                    <span className="text-sm font-medium">${category.amount}</span>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <Button className="flex-1 bg-primary hover:bg-primary/90">Submit</Button>
                <Button variant="outline" className="flex-1">Clear</Button>
              </div>
            </Card>
          </div>

          {/* Center - Budgeting form */}
          <div>
            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <PieChart className="w-6 h-6 text-primary" />
                Budgeting
              </h2>

              <div className="space-y-4 mb-6">
                <h3 className="text-lg font-semibold">Set Up Budget</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="expense">Expense</Label>
                  <Input
                    id="expense"
                    placeholder="e.g., Rent"
                    className="bg-muted/50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amount">Amount</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="$ 300"
                    className="bg-muted/50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="limit">Budget Limit</Label>
                  <Input
                    id="limit"
                    type="number"
                    placeholder="$ 500"
                    className="bg-muted/50"
                  />
                </div>

                <Button className="w-full bg-secondary hover:bg-secondary/90">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Transaction
                </Button>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Recent Transactions</h3>
                <div className="space-y-2">
                  {transactions.map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-3 bg-secondary/20 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${transaction.color}`}></div>
                        <span className="text-sm">{transaction.category}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">${transaction.amount}</span>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>

          {/* Right sidebar - Summary */}
          <div className="space-y-6">
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                Summary
              </h2>
              
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Spent</span>
                    <TrendingDown className="w-4 h-4 text-destructive" />
                  </div>
                  <div className="text-3xl font-bold">$30</div>
                  <div className="w-full bg-secondary h-2 rounded-full mt-2">
                    <div className="bg-destructive h-2 rounded-full" style={{ width: '10%' }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Remaining</span>
                    <TrendingUp className="w-4 h-4 text-event-green" />
                  </div>
                  <div className="text-3xl font-bold">$20</div>
                  <div className="text-xs text-muted-foreground">On track</div>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Expense Categories</h3>
              <div className="flex items-center justify-center h-48">
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  <div className="w-20 h-20 rounded-full bg-card"></div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default Budget;
