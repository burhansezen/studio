import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { summaryData, transactions } from '@/lib/data';
import type { Transaction } from '@/lib/types';

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-8">
      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {summaryData.map((data) => (
          <Card key={data.title} className="hover:border-primary/50 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {data.title}
              </CardTitle>
              <data.icon className="h-5 w-5 text-muted-foreground text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold font-headline">{data.value}</div>
              <p className="text-xs text-muted-foreground">{data.change}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      <section>
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Son İşlemler</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ürün</TableHead>
                  <TableHead>Tip</TableHead>
                  <TableHead>Tarih</TableHead>
                  <TableHead>Miktar</TableHead>
                  <TableHead className="text-right">Tutar</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((transaction: Transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell className="font-medium">{transaction.productName}</TableCell>
                    <TableCell>
                      <Badge variant={transaction.type === 'Satış' ? 'secondary' : transaction.type === 'İade' ? 'destructive' : 'default'}
                       className={transaction.type === 'Alış' ? 'bg-blue-500/20 text-blue-300 border-blue-500/30' : ''}>
                        {transaction.type}
                      </Badge>
                    </TableCell>
                    <TableCell>{transaction.date}</TableCell>
                    <TableCell>{transaction.quantity}</TableCell>
                    <TableCell className={`text-right font-mono ${transaction.amount > 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {transaction.amount.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
