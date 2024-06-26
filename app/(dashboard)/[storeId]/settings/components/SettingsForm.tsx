"use client";
import * as z from "zod";
import axios from "axios";
import toast from "react-hot-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { Store } from "@prisma/client";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useOrigin } from "@/hooks/useOrigin";
import { useLoadingBarStore } from "@/hooks/useLoadingBarStore";
import { useStores } from "@/hooks/useStores";

import { Button } from "@/components/ui/button";
import Heading from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { Trash as TrashIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { AlertModal } from "@/components/modals/AlertModal";
import { ApiAlert } from "@/components/ui/api-alert";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";

interface SettingsFormProps {
  initialData: Store | null;
}

const formSchema = z.object({
  name: z.string().min(1),
});

type SettingsFormValue = z.infer<typeof formSchema>;

const SettingsForm = ({ initialData }: SettingsFormProps) => {
  const params = useParams();
  const origin = useOrigin();
  const router = useRouter();
  const loadingBar = useLoadingBarStore();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { stores, setStores } = useStores();

  const form = useForm<SettingsFormValue>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData ? initialData : { name: "" },
  });

  const onSubmit = async (data: SettingsFormValue, event: any) => {
    try {
      setLoading(true);
      loadingBar.start(event);

      await axios.patch(`/api/stores/${params.storeId}`, data);

      toast.success("Store updated");

      router.refresh();
    } catch (error) {
      loadingBar.done();

      // console.trace("error: ", error);

      if (axios.isAxiosError(error))
        toast.error(
          error?.response?.status === 500 ? "Internal Server Error" : "Something went wrong. Please try again."
        );
      else toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const onDelete = async (event: any) => {
    try {
      setLoading(true);
      loadingBar.start(event);

      await axios.delete(`/api/stores/${params.storeId}`);

      setStores(stores.filter((store) => store.id !== params.storeId));

      toast.success("Store deleted");

      router.push("/");
      router.refresh();
    } catch (error) {
      loadingBar.done();

      // console.trace("error: ", error);

      if (axios.isAxiosError(error))
        toast.error(
          error?.response?.status === 500 ? "Internal Server Error" : "Something went wrong. Please try again."
        );
      else toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
      setOpen(false);
    }
  };

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <AlertModal isOpen={open} setOpen={setOpen} onConfirm={onDelete} loading={loading} />
      <div className="flex items-center justify-between ">
        <Heading title="Settings" description="Manage store preferences" />
        <Button variant="destructive" size="icon" onClick={() => setOpen(true)}>
          <TrashIcon className="h-4 w-4" />
        </Button>
      </div>
      <Separator />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 w-full">
          <div className="grid grid-cols-3 gap-8">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input disabled={loading} placeholder="Store name" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
          <Button disabled={loading} className="ml-auto" type="submit">
            Save changes
          </Button>
        </form>
      </Form>
      <Separator />
      <ApiAlert
        title="STORE_URL"
        description={`${process.env.NEXT_PUBLIC_FRONTEND_STORE_URL}/stores/${params.storeId}`}
        variant="public"
      />
      <ApiAlert title="NEXT_PUBLIC_API_URL" description={`${origin}/api/stores/${params.storeId}`} variant="public" />
    </div>
  );
};

export default SettingsForm;
