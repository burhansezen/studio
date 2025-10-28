'use client';

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
import type { Transaction } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useAppContext } from '@/context/AppContext';
import { Search } from 'lucide-react';

export default function DashboardPage() {
  const { summaryData, transactions } = useAppContext();

  return (
    <div className="flex flex-col gap-8">
      <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {summaryData.map((data, index) => (
          <Card
            key={data.title}
            className={cn(
              'transition-all hover:shadow-lg',
              index === 0
                ? 'bg-primary/5 border-primary/20 hover:border-primary/50'
                : 'hover:border-primary/20'
            )}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {data.title}
              </CardTitle>
              <data.icon
                className={cn(
                  'h-5 w-5 text-muted-foreground',
                  index === 0 && 'text-primary'
                )}
              />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold font-headline">
                {data.value}
              </div>
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
            {transactions.length > 0 ? (
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
                    <TableRow key={transaction.id} className="hover:bg-muted/50">
                        <TableCell className="font-medium">
                        {transaction.productName}
                        </TableCell>
                        <TableCell>
                        <Badge
                            variant={
                            transaction.type === 'Satış'
                                ? 'secondary'
                                : transaction.type === 'İade'
                                ? 'destructive'
                                : 'default'
                            }
                        >
                            {transaction.type}
                        </Badge>
                        </TableCell>
                        <TableCell>{transaction.date}</TableCell>
                        <TableCell>{transaction.quantity}</TableCell>
                        <TableCell
                        className={cn(
                            'text-right font-mono',
                            transaction.amount > 0
                            ? 'text-green-500' 
                            : transaction.amount < 0 ? 'text-destructive' : ''
                        )}
                        >
                        {transaction.amount.toLocaleString('tr-TR', {
                            style: 'currency',
                            currency: 'TRY',
                        })}
                        </TableCell>
                    </TableRow>
                    ))}
                </TableBody>
                </Table>
            ) : (
                <div className="flex flex-col items-center justify-center p-12 text-center">
                    <Search className="w-16 h-16 text-muted-foreground mb-4" />
                    <h3 className="text-xl font-bold font-headline mb-2">Henüz İşlem Yok</h3>
                    <p className="text-muted-foreground">Herhangi bir satış, alış veya iade işlemi gerçekleşmedi.</p>
                </div>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
